import {
  PrismaClient,
  TemplateEventType,
  TemplateProvider,
  type TemplateQualityRating,
  type TemplateCategory,
  type TemplateProviderAction,
  type TemplateStatus,
  type TemplateType
} from "@prisma/client";
import type { PreparedTemplateCreateData, TemplateListQuery, TemplateScope } from "../domain/template.types.js";

type TemplateWhereInput = {
  id?: string;
  adminUserId?: string;
  metaTemplateId?: string;
  name?: string;
  languageCode?: string;
  deletedAt?: null;
  status?: TemplateStatus;
  category?: TemplateCategory;
  type?: TemplateType;
  OR?: Array<{
    name?: { contains: string; mode: "insensitive" };
    displayName?: { contains: string; mode: "insensitive" };
  }>;
};

type TemplateOrderByInput = Partial<
  Record<NonNullable<TemplateListQuery["sortBy"]>, NonNullable<TemplateListQuery["sortOrder"]>>
>;

type TemplateDelegate = {
  findMany(args: {
    where: TemplateWhereInput;
    include?: TemplateInclude;
    skip?: number;
    take?: number;
    orderBy?: TemplateOrderByInput;
  }): Promise<TemplateRecord[]>;
  count(args: { where: TemplateWhereInput }): Promise<number>;
  findFirst(args: { where: TemplateWhereInput; include?: TemplateInclude }): Promise<TemplateRecord | null>;
  create(args: { data: unknown; include?: TemplateInclude }): Promise<TemplateRecord>;
  updateMany(args: { where: TemplateWhereInput; data: unknown }): Promise<{ count: number }>;
};

type ProviderPayloadDelegate = {
  create(args: { data: unknown }): Promise<{ id: string }>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
};

type EventDelegate = {
  create(args: { data: unknown }): Promise<unknown>;
};

type TemplateInclude = {
  components?: boolean;
  variables?: boolean;
  buttons?: boolean;
};

export type TemplateRecord = {
  id: string;
  adminUserId: string;
  metaTemplateId: string | null;
  name: string;
  displayName: string | null;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  status: TemplateStatus;
  qualityRating: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  rejectionReason: string | null;
  allowCategoryChange: boolean;
  lastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  components?: Array<{
    componentType: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | "CAROUSEL";
    format: "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "LOCATION" | null;
    text: string | null;
    sortOrder: number;
  }>;
  variables?: Array<{
    componentType: "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | "CAROUSEL";
    position: number;
    placeholder: string;
    sampleValue: string;
    sourceKey: string | null;
  }>;
  buttons?: Array<{
    buttonType: "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | "FLOW";
    text: string;
    url: string | null;
    phoneNumber: string | null;
    payload: string | null;
    flowId: string | null;
    sortOrder: number;
  }>;
};

export type TemplatesDataStore = {
  whatsAppTemplate: TemplateDelegate;
  whatsAppTemplateProviderPayload: ProviderPayloadDelegate;
  whatsAppTemplateEvent: EventDelegate;
};

const prisma = new PrismaClient() as unknown as TemplatesDataStore;

const detailInclude = {
  components: true,
  variables: true,
  buttons: true
} satisfies TemplateInclude;

export class TemplateRepository {
  constructor(private readonly db: TemplatesDataStore = prisma) {}

  async findMany(query: TemplateListQuery, scope: TemplateScope) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = this.buildWhere(query, scope);
    const [items, total] = await Promise.all([
      this.db.whatsAppTemplate.findMany({
        where,
        include: detailInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [query.sortBy ?? "updatedAt"]: query.sortOrder ?? "desc" }
      }),
      this.db.whatsAppTemplate.count({ where })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  findById(id: string, scope: TemplateScope) {
    return this.db.whatsAppTemplate.findFirst({
      where: {
        id,
        adminUserId: scope.adminUserId,
        deletedAt: null
      },
      include: detailInclude
    });
  }

  findByNameAndLanguage(name: string, languageCode: string, scope: TemplateScope) {
    return this.db.whatsAppTemplate.findFirst({
      where: {
        adminUserId: scope.adminUserId,
        name,
        languageCode,
        deletedAt: null
      }
    });
  }

  findAnyByNameAndLanguage(name: string, languageCode: string, scope: TemplateScope) {
    return this.db.whatsAppTemplate.findFirst({
      where: {
        adminUserId: scope.adminUserId,
        name,
        languageCode
      }
    });
  }

  createWithRelations(data: PreparedTemplateCreateData, scope: TemplateScope) {
    return this.db.whatsAppTemplate.create({
      data: {
        ...data.template,
        adminUserId: scope.adminUserId,
        components: { create: data.components },
        variables: { create: data.variables },
        buttons: { create: data.buttons },
        ...(data.event
          ? {
              events: {
                create: data.event
              }
            }
          : {})
      },
      include: detailInclude
    });
  }

  async updateStatus(id: string, status: TemplateStatus, scope: TemplateScope) {
    await this.db.whatsAppTemplate.updateMany({
      where: {
        id,
        adminUserId: scope.adminUserId,
        deletedAt: null
      },
      data: {
        status,
        updatedById: scope.adminUserId
      }
    });

    return this.findById(id, scope);
  }

  async updateProviderSubmissionResult(
    id: string,
    data: {
      metaTemplateId?: string | null;
      status: TemplateStatus;
      rejectionReason?: string | null;
      lastSyncedAt?: Date | null;
    },
    scope: TemplateScope
  ) {
    await this.db.whatsAppTemplate.updateMany({
      where: {
        id,
        adminUserId: scope.adminUserId,
        deletedAt: null
      },
      data: {
        ...data,
        updatedById: scope.adminUserId
      }
    });

    return this.findById(id, scope);
  }

  softDelete(id: string, scope: TemplateScope) {
    return this.db.whatsAppTemplate.updateMany({
      where: {
        id,
        adminUserId: scope.adminUserId,
        deletedAt: null
      },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
        updatedById: scope.adminUserId
      }
    });
  }

  createProviderPayload(data: {
    templateId?: string | null;
    provider?: TemplateProvider;
    action: TemplateProviderAction;
    requestPayload?: unknown;
    responsePayload?: unknown;
    statusCode?: number | null;
    errorCode?: string | null;
    errorMessage?: string | null;
  }) {
    return this.db.whatsAppTemplateProviderPayload.create({
      data: {
        provider: data.provider ?? TemplateProvider.META,
        ...data
      }
    });
  }

  updateProviderPayload(
    id: string,
    data: {
      responsePayload?: unknown;
      statusCode?: number | null;
      errorCode?: string | null;
      errorMessage?: string | null;
    }
  ) {
    return this.db.whatsAppTemplateProviderPayload.update({
      where: { id },
      data
    });
  }

  findByProviderIdentity(
    input: { metaTemplateId?: string | null; name: string; languageCode: string },
    scope: TemplateScope
  ) {
    if (input.metaTemplateId) {
      return this.db.whatsAppTemplate.findFirst({
        where: {
          adminUserId: scope.adminUserId,
          metaTemplateId: input.metaTemplateId,
          deletedAt: null
        },
        include: detailInclude
      });
    }

    return this.findByNameAndLanguage(input.name, input.languageCode, scope);
  }

  findByWebhookIdentity(input: {
    metaTemplateId?: string | null;
    name?: string | null;
    languageCode?: string | null;
    wabaId?: string | null;
  }) {
    if (input.metaTemplateId) {
      return this.db.whatsAppTemplate.findFirst({
        where: {
          metaTemplateId: input.metaTemplateId,
          ...(input.wabaId ? { wabaId: input.wabaId } : {}),
          deletedAt: null
        },
        include: detailInclude
      });
    }

    if (!input.name || !input.languageCode) return Promise.resolve(null);

    return this.db.whatsAppTemplate.findFirst({
      where: {
        name: input.name,
        languageCode: input.languageCode,
        ...(input.wabaId ? { wabaId: input.wabaId } : {}),
        deletedAt: null
      },
      include: detailInclude
    });
  }

  async updateFromWebhook(
    id: string,
    data: {
      status?: TemplateStatus;
      qualityRating?: TemplateQualityRating;
      rejectionReason?: string | null;
      lastSyncedAt: Date;
    }
  ) {
    await this.db.whatsAppTemplate.updateMany({
      where: {
        id,
        deletedAt: null
      },
      data
    });

    return this.db.whatsAppTemplate.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: detailInclude
    });
  }

  async updateFromProvider(
    id: string,
    data: {
      metaTemplateId?: string | null;
      wabaId?: string | null;
      category: TemplateCategory;
      type: TemplateType;
      languageCode: string;
      status: TemplateStatus;
      qualityRating: TemplateQualityRating;
      rejectionReason?: string | null;
      lastSyncedAt: Date;
    },
    scope: TemplateScope
  ) {
    await this.db.whatsAppTemplate.updateMany({
      where: {
        id,
        adminUserId: scope.adminUserId,
        deletedAt: null
      },
      data
    });

    return this.findById(id, scope);
  }

  createFromProvider(
    data: {
      metaTemplateId?: string | null;
      wabaId?: string | null;
      name: string;
      displayName?: string | null;
      category: TemplateCategory;
      type: TemplateType;
      languageCode: string;
      status: TemplateStatus;
      qualityRating: TemplateQualityRating;
      rejectionReason?: string | null;
      lastSyncedAt: Date;
    },
    scope: TemplateScope
  ) {
    return this.db.whatsAppTemplate.create({
      data: {
        ...data,
        adminUserId: scope.adminUserId
      },
      include: detailInclude
    });
  }

  createEvent(data: {
    templateId?: string | null;
    eventType: TemplateEventType;
    oldStatus?: TemplateStatus | null;
    newStatus?: TemplateStatus | null;
    message?: string | null;
    metadata?: unknown;
    createdById?: string | null;
  }) {
    return this.db.whatsAppTemplateEvent.create({ data });
  }

  private buildWhere(query: TemplateListQuery, scope: TemplateScope): TemplateWhereInput {
    return {
      adminUserId: scope.adminUserId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.languageCode ? { languageCode: query.languageCode } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { displayName: { contains: query.search, mode: "insensitive" } }
            ]
          }
        : {})
    };
  }
}
