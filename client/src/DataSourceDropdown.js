import React, { useEffect, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';

function DataSourceDropdown(props) {
  const dataSourceList = props.dataSourceList;
  const [selectedDataSource, setSelectedDataSource] = useState(props.selectedDataSource);

  useEffect(() => {
    if (dataSourceList.length > 0) {
      setSelectedDataSource(props.selectedDataSource);
    }
  }, [dataSourceList, props.selectedDataSource]);

  return (
    <TextField
      select
      required
      fullWidth
      id="dataSource"
      label="Data Source"
      value={selectedDataSource}
      onChange={(event) => setSelectedDataSource(event.target.value)}
    >
      {dataSourceList.map((dataSource) => (
        <MenuItem key={dataSource.id} value={dataSource.id}>
          {dataSource.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
export default DataSourceDropdown;
