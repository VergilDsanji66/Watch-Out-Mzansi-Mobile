// Temporary in-memory DB (not persistent)
export const reportsDB = [];

// Add a report
export const addReport = (report) => {
  reportsDB.push({
    id: Date.now().toString(),
    ...report
  });
};

//clear all temp data
export const clearReports = () => {
  reportsDB.length = 0;
};
