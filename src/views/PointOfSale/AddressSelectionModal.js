import React from "react";
import Modal from "react-modal";

const AddressSelectionModal = ({ isOpen, onClose, addresses, onSelect }) => {
  const modalStyle = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      maxWidth: "800px",
      width: "90%",
    },
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thTdStyle = {
    border: "1px solid #ddd",
    padding: "8px",
  };

  const thStyle = {
    ...thTdStyle,
    backgroundColor: "#f2f2f2",
  };
// console.log(addresses);
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyle}>
      <h2>Select Address</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>First Name</th>
            <th style={thStyle}>Last Name</th>
            <th style={thStyle}>Phone Number</th>
            <th style={thStyle}>Street</th>
            <th style={thStyle}>City</th>
            <th style={thStyle}>Postal Code</th>
            <th style={thStyle}>State</th>
            {/* Add additional columns as needed */}
          </tr>
        </thead>
        <tbody>
          {addresses.map((address, index) => (
            <tr
              key={index}
              onClick={() => onSelect(address)}
              style={{ cursor: "pointer", ...thTdStyle }}
            >
              <td>{address.first_Name}</td>
              <td>{address.last_Name}</td>
              <td>{address.phone_Number}</td>
              <td>{address.street}</td>
              <td>{address.city}</td>
              <td>{address.postalCode}</td>
              <td>{address.state}</td>
              {/* Add additional columns as needed */}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default AddressSelectionModal;

