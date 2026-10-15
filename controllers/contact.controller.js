import ContactModel from '../models/contact.model.js';
import AppError from '../middlewares/AppError.js';

export const getContacts = async (req, res, next) => {
  try {
    const contacts = await ContactModel.findAll();

    res.status(200).json({
      success: true,
      message: 'Contacts fetched successfully',
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id);

    if (isNaN(contactId)) {
      throw new AppError('Invalid contact ID', 400);
    }

    const contact = await ContactModel.findById(contactId);

    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Contact fetched successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, phone, email, address, instagram, facebook } = req.body;

    if (!name || !phone || !email || !address) {
      throw new AppError('Missing required fields', 400);
    }

    const newContact = await ContactModel.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      instagram: instagram ? instagram.trim() : null,
      facebook: facebook ? facebook.trim() : null,
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id);

    if (isNaN(contactId)) {
      throw new AppError('Invalid contact ID', 400);
    }

    const existingContact = await ContactModel.findById(contactId);
    if (!existingContact) {
      throw new AppError('Contact not found', 404);
    }

    const { name, phone, email, address, instagram, facebook } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (instagram !== undefined) updateData.instagram = instagram ? instagram.trim() : null;
    if (facebook !== undefined) updateData.facebook = facebook ? facebook.trim() : null;

    const updatedContact = await ContactModel.update(contactId, updateData);

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id);

    if (isNaN(contactId)) {
      throw new AppError('Invalid contact ID', 400);
    }

    const contact = await ContactModel.findById(contactId);
    if (!contact) {
      throw new AppError('Contact not found', 404);
    }

    await ContactModel.delete(contactId);

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
