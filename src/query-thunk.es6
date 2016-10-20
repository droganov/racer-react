export default function (racerModel, reactProps, sendUpdates) {
  const dispatch = (...queryArgs) => ({
    fetchAs: target =>
      new Promise((resolve, reject) => {
        const racerQuery = racerModel.query(...queryArgs);

        racerQuery.fetch(error => {
          if (error) {
            reject(error);
            return;
          }

          const rawQueryResult = racerQuery.getExtra() || racerQuery.get();

          const queryResult = {
            [target]: rawQueryResult,
          };

          sendUpdates(queryResult);
          resolve(queryResult);
        });
      }),
  });

  const thunk = (...queryArgs) => (
    typeof queryArgs[0] === 'function'
      ? thunk(queryArgs[0](reactProps))
      : dispatch(...queryArgs)
  );

  return thunk;
}
