const insertMMData = async (pool,dataArray) => {
    try {
      await pool.query('DELETE from materica_medica');
      const query = `
        INSERT INTO materica_medica (book_id, remedy_id, section_id, start_pos, end_pos, no_of_lines_sections_has)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
  
      for (const data of dataArray) {
        const values = [data.book_id, data.remedy_id, data.section_id, data.startPos, data.endPos, data.noOfLinesSectionsHas];
        await pool.query(query, values);
      }
      console.log('Data inserted successfully');
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  };

module.exports= {insertMMData}