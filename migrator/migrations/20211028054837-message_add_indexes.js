module.exports = {
  async up(db) {
    const Message = db.collection("Message");
    await Message.createIndex({ _created_at: 1 }, { name: "_created_at" });
    await Message.createIndex({ _updated_at: 1 }, { name: "_updated_at" });
  },

  async down(db) {
    const Message = db.collection("Message");
    await Message.dropIndex(["_created_at", "_updated_at"]);
  },
};
