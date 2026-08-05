export type LoginPageContext = 'townhouse' | 'system-admin';

export interface LoginPageConfig {
    readonly context: LoginPageContext;
    readonly icon: string;
    readonly eyebrow?: string;
    readonly title?: string;
    readonly subtitle?: string;
    readonly identifierPlaceholder: string;
    readonly showAccountActions?: boolean;
}

export const LOGIN_PAGE_ROUTE_DATA_KEY = 'loginPage';

export const TOWNHOUSE_LOGIN_PAGE_CONFIG: LoginPageConfig = {
    context: 'townhouse',
    icon: 'apartment',
    identifierPlaceholder: 'Ex: 11999990001 ou seu@email.com',
    showAccountActions: true,
};

export const SYSTEM_ADMIN_LOGIN_PAGE_CONFIG: LoginPageConfig = {
    context: 'system-admin',
    icon: 'admin_panel_settings',
    eyebrow: 'Acesso restrito',
    title: 'Administração do sistema',
    subtitle: 'Entre com seu telefone ou e-mail para continuar.',
    identifierPlaceholder: 'Digite seu telefone ou e-mail',
};
