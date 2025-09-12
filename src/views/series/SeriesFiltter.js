import React from 'react'

import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@material-ui/core";
import { useSeries } from './SeriesContext';

const SeriesFiltter = () => {
    const {genres}=useSeries()
  return (
    <div>
         <Grid item xs={4} style={{paddingBottom:"1rem"}}>
              <FormControl fullWidth sx={{ padding: "5px" }}>
                <InputLabel id="demo-simple-select-label">
                 Genre
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="isStandalone"
                  name="isStandalone"
                  // onChange={handleChange}
                  // value={episodeData.isStandalone}
                  fullWidth
                >
                  {genres.map((item,index) => (
                    <MenuItem value={item._id} key={item._id}>{item.genrename}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
    </div>
  )
}

export default SeriesFiltter
