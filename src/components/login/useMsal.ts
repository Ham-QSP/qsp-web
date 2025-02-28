import type { AccountInfo } from "@azure/msal-browser";
import { InteractionStatus, PublicClientApplication } from "@azure/msal-browser";
import { getCurrentInstance, toRefs } from "vue";
import type { Ref } from "vue";

export type MsalContext = {
  instance: PublicClientApplication,
  accounts: Ref<AccountInfo[]>,
  inProgress: Ref<InteractionStatus>
}

export function useMsal(): MsalContext {
  const internalInstance = getCurrentInstance();
  if (!internalInstance) {
    throw "useMsal() cannot be called outside the setup() function of a component";
  }
  const { instance, accounts, inProgress} = toRefs(internalInstance.appContext.config.globalProperties.$msal);

  if (!instance || !accounts || !inProgress) {
    throw "Please install the msalPlugin";
  }

  if (inProgress.value === InteractionStatus.Startup) {
    instance.value.initialize().then(() => {
      instance.value.handleRedirectPromise().catch(() => {
        // Errors should be handled by listening to the LOGIN_FAILURE event
        return;
      });
    });
  }

  return {
    instance: instance.value,
    accounts,
    inProgress
  }
}

export function userIsAuthenticated(): Ref<boolean> {
  const { accounts } = useMsal();
  const isAuthenticated = ref(accounts.value.length > 0);

  watch(accounts, () => {
    isAuthenticated.value = accounts.value.length > 0;
  });

  return isAuthenticated;
}
