import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PublishedProject, PublishedProjectSchema } from './schemas/published-project.schema';
import { ProjectPurchase, ProjectPurchaseSchema } from './schemas/project-purchase.schema';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { UserWallet, UserWalletSchema } from './schemas/user-wallet.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PublishedProject.name, schema: PublishedProjectSchema },
      { name: ProjectPurchase.name, schema: ProjectPurchaseSchema },
      { name: Wishlist.name, schema: WishlistSchema },
      { name: UserWallet.name, schema: UserWalletSchema },
    ]),
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
