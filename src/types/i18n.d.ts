import "i18next";
import type commonVi from "../locales/vi/common.json";
import type homeVi from "../locales/vi/home.json";
import type authVi from "../locales/vi/auth.json";
import type dashboardVi from "../locales/vi/dashboard.json";
import type featureGateVi from "../locales/vi/featureGate.json";
import type storeVi from "../locales/vi/store.json";
import type saleVi from "../locales/vi/sale.json";
import type productVi from "../locales/vi/product.json";
import type customerVi from "../locales/vi/customer.json";
import type ordersVi from "../locales/vi/orders.json";
import type staffVi from "../locales/vi/staff.json";
import type tasksVi from "../locales/vi/tasks.json";
import type crmVi from "../locales/vi/crm.json";
import type timekeepingVi from "../locales/vi/timekeeping.json";
import type profileVi from "../locales/vi/profile.json";
import type inventoryVi from "../locales/vi/inventory.json";
import type reportsVi from "../locales/vi/reports.json";
import type subscriptionVi from "../locales/vi/subscription.json";
import type paymentVi from "../locales/vi/payment.json";
import type feedbackVi from "../locales/vi/feedback.json";
import type adminVi from "../locales/vi/admin.json";
import type chatbotVi from "../locales/vi/chatbot.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof commonVi;
      home: typeof homeVi;
      auth: typeof authVi;
      dashboard: typeof dashboardVi;
      featureGate: typeof featureGateVi;
      store: typeof storeVi;
      sale: typeof saleVi;
      product: typeof productVi;
      customer: typeof customerVi;
      orders: typeof ordersVi;
      staff: typeof staffVi;
      tasks: typeof tasksVi;
      crm: typeof crmVi;
      timekeeping: typeof timekeepingVi;
      profile: typeof profileVi;
      inventory: typeof inventoryVi;
      reports: typeof reportsVi;
      subscription: typeof subscriptionVi;
      payment: typeof paymentVi;
      feedback: typeof feedbackVi;
      admin: typeof adminVi;
      chatbot: typeof chatbotVi;
    };
  }
}

