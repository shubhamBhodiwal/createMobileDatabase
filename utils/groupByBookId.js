const groupByBookId = (data) => {
    const groupedData = data.reduce((accumulator, currentItem) => {
      const index = accumulator.findIndex((item) => item.book_id === currentItem.book_id);
  
      if (index !== -1) {
        accumulator[index].data.push(currentItem);
      } else {
        accumulator.push({ book_id: currentItem.book_id, data: [currentItem] });
      }
  
      return accumulator;
    }, []);
  
    return groupedData;
  };

  module.exports ={groupByBookId}