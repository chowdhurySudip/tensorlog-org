'use strict';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(isoDate) {
  const [year, month] = isoDate.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTHS[monthIndex]} ${year}`;
}

module.exports = { formatDate };
