import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const unseenMessages = await Message.find({
      senderId: userToChatId,
      receiverId: myId,
      seen: false,
      deletedForEveryone: false,
    }).select("_id senderId receiverId");

    if (unseenMessages.length === 0) {
      return res.status(200).json({ updatedCount: 0, seenMessageIds: [] });
    }

    const seenAt = new Date();
    const seenMessageIds = unseenMessages.map((message) => message._id);

    await Message.updateMany(
      { _id: { $in: seenMessageIds } },
      {
        $set: {
          seen: true,
          seenAt,
        },
      }
    );

    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        byUserId: myId.toString(),
        chatUserId: userToChatId,
        seenMessageIds: seenMessageIds.map((id) => id.toString()),
        seenAt: seenAt.toISOString(),
      });
    }

    res.status(200).json({
      updatedCount: seenMessageIds.length,
      seenMessageIds: seenMessageIds.map((id) => id.toString()),
      seenAt: seenAt.toISOString(),
    });
  } catch (error) {
    console.log("Error in markMessagesAsSeen controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(myId)) {
      return res.status(403).json({ message: "You can only delete your own messages." });
    }

    if (message.deletedForEveryone) {
      return res.status(200).json(message);
    }

    const wasUnreadForReceiver = !message.seen;

    message.deletedForEveryone = true;
    message.deletedAt = new Date();
    message.deletedBy = myId;
    message.text = "";
    message.image = "";
    message.video = "";
    message.audio = "";
    message.seen = false;
    message.seenAt = null;

    await message.save();

    const deletedMessagePayload = {
      _id: message._id.toString(),
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      deletedForEveryone: true,
      deletedAt: message.deletedAt?.toISOString() || null,
      deletedBy: myId.toString(),
      wasUnreadForReceiver,
    };

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", deletedMessagePayload);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in deleteMessageForEveryone controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;
    const { text } = req.body;

    const trimmedText = text?.trim();
    if (!trimmedText) {
      return res.status(400).json({ message: "Updated text is required." });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    if (!message.senderId.equals(myId)) {
      return res.status(403).json({ message: "You can only edit your own messages." });
    }

    if (message.deletedForEveryone) {
      return res.status(400).json({ message: "Deleted messages cannot be edited." });
    }

    if (message.image || message.video || message.audio) {
      return res.status(400).json({ message: "Only text messages can be edited." });
    }

    message.text = trimmedText;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUpdated", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, video, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const trimmedText = text?.trim() || "";

    if (!trimmedText && !image && !video && !audio) {
      return res.status(400).json({ message: "Message text or media is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    let videoUrl;
    let audioUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    if (video) {
      const uploadResponse = await cloudinary.uploader.upload(video, {
        resource_type: "video",
      });
      videoUrl = uploadResponse.secure_url;
    }
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video",
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: trimmedText,
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const [chatPartners, unreadCounts] = await Promise.all([
      User.find({ _id: { $in: chatPartnerIds } }).select("-password"),
      Message.aggregate([
        {
          $match: {
            receiverId: loggedInUserId,
            seen: false,
            deletedForEveryone: false,
          },
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const unreadCountByUserId = unreadCounts.reduce((acc, entry) => {
      acc[entry._id.toString()] = entry.count;
      return acc;
    }, {});

    const chatPartnersWithUnreadCounts = chatPartners.map((partner) => ({
      ...partner.toObject(),
      unreadCount: unreadCountByUserId[partner._id.toString()] || 0,
    }));

    res.status(200).json(chatPartnersWithUnreadCounts);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
