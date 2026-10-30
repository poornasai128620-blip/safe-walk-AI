import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { dbStore } from '../repositories/store.js';
import { TrustedContactSchema } from '@safewalk/validation';
import { TrustedContact } from '@safewalk/shared-types';

export const contactsRouter = Router();

// GET /contacts
contactsRouter.get('/', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const stored = dbStore.users.get(req.user!.id);
  return res.json(stored?.contacts || []);
});

// POST /contacts
contactsRouter.post('/', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const validated = TrustedContactSchema.parse(req.body);
    const stored = dbStore.users.get(req.user!.id);
    if (!stored) {
      return res.status(404).json({ error: 'NotFound', message: 'User not found' });
    }

    const newContact: TrustedContact = {
      id: uuidv4(),
      user_id: req.user!.id,
      contact_name: validated.contact_name,
      relationship: validated.relationship || null,
      phone_number: validated.phone_number,
      email: validated.email || null,
      notification_preferences: validated.notification_preferences,
      verified_at: new Date().toISOString(), // Instant verified for testing
      created_at: new Date().toISOString()
    };

    stored.contacts.push(newContact);
    dbStore.addAuditLog(req.user!.id, 'TRUSTED_CONTACT_ADDED', 'trusted_contacts', newContact.id, {
      name: newContact.contact_name,
      phone: newContact.phone_number
    });

    return res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
});

// PATCH /contacts/:id
contactsRouter.patch('/:id', authenticate, (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { id } = req.params;
    const validated = TrustedContactSchema.partial().parse(req.body);
    const stored = dbStore.users.get(req.user!.id);
    if (!stored) return res.status(404).json({ error: 'NotFound' });

    const contact = stored.contacts.find(c => c.id === id);
    if (!contact) {
      return res.status(404).json({ error: 'NotFound', message: 'Contact not found' });
    }

    if (validated.contact_name) contact.contact_name = validated.contact_name;
    if (validated.relationship !== undefined) contact.relationship = validated.relationship;
    if (validated.phone_number) contact.phone_number = validated.phone_number;
    if (validated.email !== undefined) contact.email = validated.email;
    if (validated.notification_preferences) contact.notification_preferences = validated.notification_preferences;

    dbStore.addAuditLog(req.user!.id, 'TRUSTED_CONTACT_UPDATED', 'trusted_contacts', id);
    return res.json(contact);
  } catch (err) {
    next(err);
  }
});

// DELETE /contacts/:id
contactsRouter.delete('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const stored = dbStore.users.get(req.user!.id);
  if (!stored) return res.status(404).json({ error: 'NotFound' });

  const initialLength = stored.contacts.length;
  stored.contacts = stored.contacts.filter(c => c.id !== id);

  if (stored.contacts.length === initialLength) {
    return res.status(404).json({ error: 'NotFound', message: 'Contact not found' });
  }

  dbStore.addAuditLog(req.user!.id, 'TRUSTED_CONTACT_DELETED', 'trusted_contacts', id);
  return res.json({ message: 'Contact removed successfully' });
});

// POST /contacts/:id/verify
contactsRouter.post('/:id/verify', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const stored = dbStore.users.get(req.user!.id);
  if (!stored) return res.status(404).json({ error: 'NotFound' });

  const contact = stored.contacts.find(c => c.id === id);
  if (!contact) {
    return res.status(404).json({ error: 'NotFound', message: 'Contact not found' });
  }

  contact.verified_at = new Date().toISOString();
  dbStore.addAuditLog(req.user!.id, 'TRUSTED_CONTACT_VERIFIED', 'trusted_contacts', id);
  return res.json({ message: 'Contact verified successfully', contact });
});
