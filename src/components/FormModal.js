import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import apiService from "../app/apiService";
import Joi from "joi";
import moment from "moment";

const initial_form = {
  Make: "",
  Model: "",
  Year: "",
  TransmissionType: "",
  MSRP: 0,
  VehicleSize: "",
  VehicleStyle: "",
};

export default function FormModal({
  open,
  handleClose,
  mode,
  selectedCar,
  modalKey,
  refreshData,
}) {
  const [form, setForm] = useState(initial_form);
  const [errors, setErrors] = useState({});
  const schema = Joi.object({
    Make: Joi.string().required(),
    Model: Joi.string().required(),
    Year: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear())
      .required(),
    TransmissionType: Joi.string()
      .valid(
        "MANUAL",
        "AUTOMATIC",
        "AUTOMATED_MANUAL",
        "DIRECT_DRIVE",
        "UNKNOWN"
      )
      .required(),
    MSRP: Joi.number().integer().min(1000).required(),
    VehicleSize: Joi.string().valid("Compact", "Midsize", "Large").required(),
    VehicleStyle: Joi.string().required(),
  }).options({ stripUnknown: true, abortEarly: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  const handleEdit = async (newForm) => {
    try {
      await apiService.put(`/cars/${selectedCar?._id}`, { ...newForm });
      refreshData();
    } catch (err) {
      console.log(err);
    }
  };
  const handleCreate = async (newForm) => {
    try {
      const res = await apiService.post("/cars", { ...newForm });
      refreshData();
      console.log(res);
    } catch (err) {
      console.log(err.message);
    }
  };
  const handleSubmit = () => {
    const validate = schema.validate(form);
    if (validate.error) {
      const newErrors = {};
      validate.error.details.forEach(
        (item) => (newErrors[item.path[0]] = item.message)
      );
      setErrors(newErrors);
    } else {
      if (mode === "create") handleCreate(validate.value);
      else handleEdit(validate.value);
      // handleClose();
    }
  };
  useEffect(() => {
    if (selectedCar?._id) {
      setErrors({});
      setForm(selectedCar);
    } else setForm(initial_form);
  }, [selectedCar]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} key={modalKey}>
      <Dialog
        open={open}
        onClose={() => {
          handleClose();
          setErrors({});
        }}
      >
        <DialogTitle>
          {mode === "create" ? "CREATE A NEW CAR" : "EDIT CAR"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              error={errors.Make}
              helperText={errors.Make ? errors.Make : null}
              value={form.Make}
              autoFocus
              margin="dense"
              name="Make"
              label="Make"
              type="text"
              fullWidth
              variant="standard"
              onChange={handleChange}
            />
            <TextField
              error={errors.Model}
              helperText={errors.Model ? errors.Model : null}
              value={form.Model}
              onChange={handleChange}
              autoFocus
              margin="dense"
              name="Model"
              label="Model"
              type="text"
              fullWidth
              variant="standard"
            />
            <FormControl
              error={errors.TransmissionType}
              variant="standard"
              sx={{ m: 1, minWidth: 120 }}
            >
              <InputLabel id="TransmissionType_label">
                Transmission Type
              </InputLabel>
              <Select
                labelId="TransmissionType_label"
                name="TransmissionType"
                value={form.TransmissionType}
                onChange={handleChange}
                label="Transmission Type"
              >
                {[
                  "MANUAL",
                  "AUTOMATIC",
                  "AUTOMATED_MANUAL",
                  "DIRECT_DRIVE",
                  "UNKNOWN",
                ].map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
              {errors.TransmissionType ? (
                <FormHelperText>{errors.TransmissionType}</FormHelperText>
              ) : null}
            </FormControl>
            <FormControl
              error={errors.VehicleSize}
              variant="standard"
              sx={{ m: 1, minWidth: 120 }}
            >
              <InputLabel id="size-label">Size</InputLabel>
              <Select
                labelId="VehicleSize-label"
                name="VehicleSize"
                value={form.VehicleSize}
                onChange={handleChange}
                label="VehicleSize"
              >
                {["Compact", "Midsize", "Large"].map((item) => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
              {errors.VehicleSize ? (
                <FormHelperText>{errors.VehicleSize}</FormHelperText>
              ) : null}
            </FormControl>
            <TextField
              error={errors.VehicleStyle}
              helperText={errors.VehicleStyle ? errors.VehicleStyle : null}
              value={form.VehicleStyle}
              margin="dense"
              name="VehicleStyle"
              label="Style"
              type="text"
              fullWidth
              variant="standard"
              onChange={handleChange}
            />
            <Stack direction="row" spacing={2}>
              <DatePicker
                views={["year"]}
                label="Year"
                value={moment(form.Year).format("YYYY")}
                error={errors.Year}
                onChange={(newValue) => {
                  setForm({ ...form, Year: moment(newValue).year() });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    helperText={errors.Year ? errors.Year : null}
                  />
                )}
              />

              <TextField
                value={form.MSRP}
                onChange={handleChange}
                error={errors.MSRP}
                helperText={errors.MSRP ? errors.MSRP : null}
                margin="dense"
                name="MSRP"
                label="MSRP"
                type="number"
                variant="standard"
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
