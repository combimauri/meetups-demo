import { provideCopilotChatLabels } from '@copilotkit/angular';

/** Textos del chat en español. Cada paso cambia el mensaje de bienvenida. */
export function etiquetasChat(bienvenida: string) {
  return provideCopilotChatLabels({
    chatInputPlaceholder: 'Escribe un mensaje…',
    chatInputToolbarAddButtonLabel: 'Adjuntar',
    chatInputToolbarToolsButtonLabel: 'Herramientas',
    assistantMessageToolbarCopyCodeLabel: 'Copiar',
    assistantMessageToolbarCopyCodeCopiedLabel: 'Copiado',
    assistantMessageToolbarCopyMessageLabel: 'Copiar',
    assistantMessageToolbarThumbsUpLabel: 'Buena respuesta',
    assistantMessageToolbarThumbsDownLabel: 'Mala respuesta',
    assistantMessageToolbarReadAloudLabel: 'Leer en voz alta',
    assistantMessageToolbarRegenerateLabel: 'Regenerar',
    userMessageToolbarCopyMessageLabel: 'Copiar',
    userMessageToolbarEditMessageLabel: 'Editar',
    chatDisclaimerText: 'Demo con datos de ejemplo. La IA puede equivocarse.',
    welcomeMessageText: bienvenida,
  });
}
