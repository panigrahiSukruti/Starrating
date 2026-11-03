import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getOwnerDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { sortBy = 'createdAt', order = 'desc' } = req.query;

    const store = await prisma.store.findUnique({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      res.status(404).json({
        error: 'No store associated with this store owner account yet. Please contact system administrator.'
      });
      return;
    }

    const totalRatings = store.ratings.length;
    const sumRatings = store.ratings.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalRatings > 0 ? Number((sumRatings / totalRatings).toFixed(1)) : 0;

    const ratingsList = store.ratings.map((r) => ({
      id: r.id,
      userId: r.user.id,
      userName: r.user.name,
      userEmail: r.user.email,
      rating: r.rating,
      createdAt: r.createdAt.toISOString()
    }));

    const sortOrder = order === 'asc' ? 1 : -1;
    ratingsList.sort((a, b) => {
      if (sortBy === 'rating') {
        return (a.rating - b.rating) * sortOrder;
      }
      if (sortBy === 'userName') {
        return a.userName.localeCompare(b.userName) * sortOrder;
      }
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder;
    });

    res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        totalRatings
      },
      ratings: ratingsList
    });
  } catch (error) {
    console.error('Error fetching owner dashboard:', error);
    res.status(500).json({ error: 'Internal server error fetching owner dashboard' });
  }
};

