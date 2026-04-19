import { useState, useEffect } from "react";

const MiComponente = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const sheetId = '1wrTzRcbtQBUWXk35Ac8g9qw0O6muLJxZ3KLDbfzKvBY';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    fetch(url)
      .then(res => res.text())
      .then(text => {
        // Limpiamos la respuesta de Google
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const jsonData = JSON.parse(jsonString);

        // Extraemos los nombres de las columnas (Headers)
        const cols = jsonData.table.cols.map(col => col.label);

        // Transformamos las filas en objetos con sus llaves correspondientes
        const rows = jsonData.table.rows.map(row => {
          const item = {};
          row.c.forEach((cell, i) => {
            const key = cols[i] || `columna_${i}`; // Si la columna no tiene nombre, le asigna uno
            item[key] = cell ? cell.v : null;
          });
          return item;
        });

        setData(rows);
      })
      .catch(err => console.error("Error cargando la Sheet:", err));
  }, []);

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

export default MiComponente;