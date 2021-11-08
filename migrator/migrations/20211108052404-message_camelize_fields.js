module.exports = {
  async up(db) {
    const Message = db.collection("Message");
    Message.rename("message");

    const message = db.collection("message");
    message.updateMany(
      {},
      {
        $rename: {
          _created_at: "_createdAt",
          _updated_at: "_updatedAt",
          sender_handle: "senderHandle",
        },
      },
    );
  },

  async down(db, client) {
    const message = db.collection("message");
    message.rename("Message");

    const Message = db.collection("Message");
    Message.updateMany(
      {},
      {
        $rename: {
          _created_at: "_created_at",
          _updated_at: "_updated_at",
          sender_handle: "sender_handle",
        },
      },
    );
  },
};
