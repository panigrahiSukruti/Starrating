import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, sortBy = 'name', order = 'asc' } = req.query;
    const currentUserId = req.user?.id;

    const whereClause: any = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.trim();
      whereClause.OR = [
        { name: { contains: query } },
        { address: { contains: query } }
      ];
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true
          }
        }
      }
    });

    let formattedStores = stores.map((store) => {
      const ratingCount = store.ratings.length;
      const totalScore = store.ratings.reduce((acc, r) => acc + r.rating, 0);
      const overallRating = ratingCount > 0 ? Number((totalScore / ratingCount).toFixed(1)) : 0;

      let userRating: number | null = null;
      if (currentUserId) {
        const foundUserRating = store.ratings.find((r) => r.userId === currentUserId);
        if (foundUserRating) {
          userRating = foundUserRating.rating;
        }
      }

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        overallRating,
        totalRatings: ratingCount,
        userRating
      };
    });

    const sortOrder = order === 'desc' ? -1 : 1;
    formattedStores.sort((a, b) => {
      if (sortBy === 'rating' || sortBy === 'overallRating') {
        return (a.overallRating - b.overallRating) * sortOrder;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * sortOrder;
      }
      return a.name.localeCompare(b.name) * sortOrder;
    });

    res.status(200).json(formattedStores);
  } catch (error) {
    console.error('Error fetching stores for users:', error);
    res.status(500).json({ error: 'Internal server error fetching stores' });
  }
};

export const submitOrUpdateRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Authentication required to submit rating' });
      return;
    }

    const { storeId, rating } = req.body;

    // Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }

    // Atomic upsert with compound unique constraint
    const ratingEntity = await prisma.rating.upsert({
      where: {
        user_store_rating_unique: { userId, storeId }
      },
      update: {
        rating
      },
      create: {
        userId,
        storeId,
        rating
      }
    });

    res.status(200).json({
      message: 'Rating submitted successfully',
      rating: ratingEntity
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ error: 'Internal server error submitting rating' });
  }
};

