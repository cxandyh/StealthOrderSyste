import bcrypt from "bcryptjs";
import {
  CommentVisibility,
  CustomerVisibleStatus,
  DiscrepancyStatus,
  DiscrepancyType,
  FactoryOrderStatus,
  KayakBuildInternalStatus,
  NotificationChannel,
  NotificationDeliveryStatus,
  NotificationEntityType,
  NotificationEventType,
  OrderItemCategory,
  PrismaClient,
  ReceivedBuildStatus,
  ReceivingSessionStatus,
  UserRole,
} from "../src/generated/prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.notificationEvent.deleteMany();
  await prisma.customerPortalToken.deleteMany();
  await prisma.buildComment.deleteMany();
  await prisma.receivedBuildCheck.deleteMany();
  await prisma.receivedItemCheck.deleteMany();
  await prisma.receivingSession.deleteMany();
  await prisma.discrepancy.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.kayakBuild.deleteMany();
  await prisma.factoryOrder.deleteMany();
  await prisma.catalogueItem.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.dealer.deleteMany();

  const dealer = await prisma.dealer.create({
    data: {
      name: "Stealth Kayaks NZ",
      slug: "stealth-nz",
      region: "New Zealand",
      currency: "NZD",
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      name: "Stealth Kayaks South Africa",
      code: "STEALTH-SA",
    },
  });

  const passwordHash = await bcrypt.hash("stealth-demo", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@stealthorderhub.local",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const dealerUser = await prisma.user.create({
    data: {
      name: "Dealer Admin",
      email: "dealer@stealthorderhub.local",
      passwordHash,
      role: UserRole.DEALER_ADMIN,
      dealerId: dealer.id,
    },
  });

  const factoryUser = await prisma.user.create({
    data: {
      name: "Factory User",
      email: "factory@stealthorderhub.local",
      passwordHash,
      role: UserRole.FACTORY_USER,
      supplierId: supplier.id,
    },
  });

  const customer = await prisma.customer.create({
    data: {
      dealerId: dealer.id,
      firstName: "Jules",
      lastName: "Barker",
      email: "jules@example.com",
      phone: "+64 21 555 0102",
      notes: "Prefers weekend pickup updates.",
    },
  });

  await prisma.catalogueItem.createMany({
    data: [
      {
        dealerId: dealer.id,
        supplierId: supplier.id,
        sku: "RH-STD-BLK",
        name: "Standard Rod Holder",
        category: OrderItemCategory.ACCESSORY,
        variantInfo: "Black",
      },
      {
        dealerId: dealer.id,
        supplierId: supplier.id,
        sku: "RUD-KIT-01",
        name: "Rudder Install Kit",
        category: OrderItemCategory.PART,
      },
    ],
  });

  const reviewOrder = await prisma.factoryOrder.create({
    data: {
      dealerId: dealer.id,
      supplierId: supplier.id,
      orderNumber: "SOS-1001",
      title: "Autumn custom build batch",
      status: FactoryOrderStatus.IN_REVIEW,
      notes: "Factory clarification still open on tape finish.",
      createdByUserId: dealerUser.id,
      submittedAt: new Date("2026-02-20T08:00:00.000Z"),
    },
  });

  const demoPortalToken = "demo-portal-token-jules-2026-long-secret";

  const customerBuild = await prisma.kayakBuild.create({
    data: {
      factoryOrderId: reviewOrder.id,
      dealerId: dealer.id,
      customerId: customer.id,
      model: "Pro Fisha 475",
      materialType: "Carbon Hybrid",
      colourType: "CUSTOM",
      deckColour: "Arctic White",
      hullColour: "Signal Orange",
      tapeColour: "Charcoal",
      tipColour1: "Orange",
      tipColour2: "White",
      bandColour1: "Black",
      bandColour2: "Charcoal",
      stripeColour1: "Silver",
      decals: "Minimal stealth logo set",
      rodHolderDetails: "2 rear flush mount, 1 center starport",
      specialRequests: "Install live transducer channel cover.",
      additionalNotes: "Customer wants a clean deck layout for offshore trolling.",
      internalStatus: KayakBuildInternalStatus.SUBMITTED_TO_FACTORY,
      customerVisibleStatus: CustomerVisibleStatus.IN_PRODUCTION,
      buildSummaryJson: {
        colours: ["Arctic White", "Signal Orange", "Charcoal", "Silver"],
      },
      portalToken: {
        create: {
          token: demoPortalToken,
        },
      },
      comments: {
        create: [
          {
            authorUserId: dealerUser.id,
            authorRole: UserRole.DEALER_ADMIN,
            visibility: CommentVisibility.DEALER_FACTORY,
            message: "Can you confirm the tape will stay matte rather than gloss?",
          },
          {
            authorUserId: factoryUser.id,
            authorRole: UserRole.FACTORY_USER,
            visibility: CommentVisibility.CUSTOMER_VISIBLE,
            message: "Your hull is now in production and mould prep has started.",
          },
        ],
      },
    },
  });

  await prisma.orderItem.createMany({
    data: [
      {
        factoryOrderId: reviewOrder.id,
        dealerId: dealer.id,
        linkedKayakBuildId: customerBuild.id,
        category: OrderItemCategory.ACCESSORY,
        sku: "RH-STD-BLK",
        name: "Standard Rod Holder",
        quantity: 2,
        notes: "Match centerline install layout.",
      },
      {
        factoryOrderId: reviewOrder.id,
        dealerId: dealer.id,
        category: OrderItemCategory.PART,
        sku: "RUD-KIT-01",
        name: "Rudder Install Kit",
        quantity: 1,
      },
    ],
  });

  const receivingOrder = await prisma.factoryOrder.create({
    data: {
      dealerId: dealer.id,
      supplierId: supplier.id,
      orderNumber: "SOS-1002",
      title: "Late summer stock replenishment",
      status: FactoryOrderStatus.RECEIVING,
      notes: "Container landed in Auckland and is being checked.",
      createdByUserId: dealerUser.id,
      submittedAt: new Date("2026-01-14T08:00:00.000Z"),
    },
  });

  const stockBuild = await prisma.kayakBuild.create({
    data: {
      factoryOrderId: receivingOrder.id,
      dealerId: dealer.id,
      intendedForStock: true,
      allocationLabel: "Floor stock",
      model: "Fusion 480",
      materialType: "Fiberglass",
      colourType: "SOLID",
      deckColour: "Storm Grey",
      hullColour: "Storm Grey",
      tapeColour: "Black",
      decals: "Standard",
      rodHolderDetails: "2 flush mount",
      internalStatus: KayakBuildInternalStatus.ARRIVED,
      customerVisibleStatus: CustomerVisibleStatus.ARRIVED_IN_COUNTRY,
      serialNumber: "SA-480-66291",
    },
  });

  const stockItem = await prisma.orderItem.create({
    data: {
      factoryOrderId: receivingOrder.id,
      dealerId: dealer.id,
      category: OrderItemCategory.PART,
      sku: "COVER-HATCH-02",
      name: "Front Hatch Cover",
      quantity: 3,
    },
  });

  const receivingSession = await prisma.receivingSession.create({
    data: {
      factoryOrderId: receivingOrder.id,
      dealerId: dealer.id,
      startedByUserId: dealerUser.id,
      status: ReceivingSessionStatus.IN_PROGRESS,
      notes: "One hatch cover carton appears short.",
    },
  });

  await prisma.receivedBuildCheck.create({
    data: {
      receivingSessionId: receivingSession.id,
      kayakBuildId: stockBuild.id,
      receivedStatus: ReceivedBuildStatus.RECEIVED_OK,
      receivedSerialNumber: "SA-480-66291",
      serialMatch: true,
    },
  });

  await prisma.receivedItemCheck.create({
    data: {
      receivingSessionId: receivingSession.id,
      orderItemId: stockItem.id,
      expectedQty: 3,
      receivedQty: 2,
      notes: "One missing from carton.",
    },
  });

  await prisma.discrepancy.create({
    data: {
      dealerId: dealer.id,
      factoryOrderId: receivingOrder.id,
      orderItemId: stockItem.id,
      discrepancyType: DiscrepancyType.QUANTITY_SHORT,
      status: DiscrepancyStatus.OPEN,
      description: "Received 2 of 3 hatch covers during intake.",
      createdByUserId: dealerUser.id,
    },
  });

  await prisma.notificationEvent.create({
    data: {
      dealerId: dealer.id,
      eventType: NotificationEventType.CUSTOMER_STATUS_CHANGED,
      entityType: NotificationEntityType.KAYAK_BUILD,
      entityId: customerBuild.id,
      recipientUserId: adminUser.id,
      recipientEmail: customer.email,
      channel: NotificationChannel.EMAIL,
      status: NotificationDeliveryStatus.SKIPPED,
      payloadJson: {
        reason: "Demo seed record",
        portalToken: demoPortalToken,
      },
    },
  });

  console.log("Seed complete");
  console.log("Demo login password: stealth-demo");
  console.log("Admin: admin@stealthorderhub.local");
  console.log("Dealer admin: dealer@stealthorderhub.local");
  console.log("Factory user: factory@stealthorderhub.local");
  console.log(`Demo portal token: ${demoPortalToken}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
