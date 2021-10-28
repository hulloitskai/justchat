module.exports = {
  async up(db) {
    const Message = db.collection("Message");
    Message.updateMany(
      { sender: { $exists: true } },
      {
        $rename: {
          sender: "sender_handle",
        },
      },
    );
  },

  async down(db) {
    const Message = db.collection("Message");
    Message.updateMany(
      { sender_handle: { $exists: true } },
      {
        $rename: {
          sender_handle: "sender",
        },
      },
    );
  },
};
