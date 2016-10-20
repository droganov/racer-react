export default racerModel => cb => {
  racerModel.bundle((err, racerBundle) => {
    cb(err, JSON.stringify(racerBundle));
  });
};
