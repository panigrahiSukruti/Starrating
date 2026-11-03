import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { Role } from '../config/constants';

export const getMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count()
    ]);

    res.status(200).json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Internal server error fetching metrics' });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, sortBy = 'createdAt', order = 'desc' } = req.query;

    const whereClause: any = {};

    if (role && typeof role === 'string' && role.trim() !== '' && role !== 'ALL') {
      whereClause.role = role.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { address: { contains: query } }
      ];
    }

    const validSortFields = ['name', 'email', 'role', 'address', 'createdAt'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: {
                rating: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortField]: sortOrder
      }
    });

    const formattedUsers = users.map((user) => {
      let assignedStoreRatingAverage: number | null = null;
      let storeInfo: { id: string; name: string } | null = null;

      if (user.store) {
        storeInfo = {
          id: user.store.id,
          name: user.store.name
        };
        const ratings = user.store.ratings;
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
          assignedStoreRatingAverage = Number((sum / ratings.length).toFixed(1));
        }
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        store: storeInfo,
        assignedStoreRatingAverage
      };
    });

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error fetching users' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        address: address.trim(),
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error creating user' });
  }
};

export const createStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, address, ownerId } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingStoreEmail = await prisma.store.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingStoreEmail) {
      res.status(409).json({ error: 'Store with this email already exists' });
      return;
    }

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      include: { store: true }
    });

    if (!owner) {
      res.status(404).json({ error: 'Assigned store owner not found' });
      return;
    }

    if (owner.role !== Role.STORE_OWNER) {
      res.status(400).json({ error: 'Selected user must have the STORE_OWNER role' });
      return;
    }

    if (owner.store) {
      res.status(409).json({ error: 'This owner already has an assigned store' });
      return;
    }

    const newStore = await prisma.store.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        address: address.trim(),
        ownerId
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(newStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ error: 'Internal server error creating store' });
  }
};

export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const whereClause: any = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query } },
        { email: { contains: query } },
        { address: { contains: query } }
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ratings: {
          select: {
            rating: true
          }
        }
      }
    });

    let formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const totalScore = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const overallRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        ownerId: store.ownerId,
        owner: store.owner,
        overallRating,
        ratingCount,
        createdAt: store.createdAt
      };
    });

    const validSortFields = ['name', 'email', 'rating', 'address', 'createdAt'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    formattedStores.sort((a, b) => {
      if (sortField === 'rating') {
        return (a.overallRating - b.overallRating) * sortOrder;
      }
      const valA = (a as any)[sortField] || '';
      const valB = (b as any)[sortField] || '';
      if (valA < valB) return -1 * sortOrder;
      if (valA > valB) return 1 * sortOrder;
      return 0;
    });

    res.status(200).json(formattedStores);
  } catch (error) {
    console.error('Error fetching admin stores:', error);
    res.status(500).json({ error: 'Internal server error fetching stores' });
  }
};

export const getAvailableOwners = async (_req: Request, res: Response): Promise<void> => {
  try {
    const owners = await prisma.user.findMany({
      where: {
        role: Role.STORE_OWNER,
        store: null
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(owners);
  } catch (error) {
    console.error('Error fetching available owners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

