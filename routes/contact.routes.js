import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contact.controller.js';

const contactRoutes = express.Router();

// GET all contacts
contactRoutes.get('/', getContacts);

// GET contact by ID
contactRoutes.get('/:id', getContactById);

// CREATE contact
contactRoutes.post('/', createContact);

// UPDATE contact
contactRoutes.put('/:id', updateContact);

// DELETE contact
contactRoutes.delete('/:id', deleteContact);

export default contactRoutes;
