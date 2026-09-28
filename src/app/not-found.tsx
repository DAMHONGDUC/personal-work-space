import { ButtonRow } from "@/components/layout/ButtonRow";
import { MessageBlock } from "@/components/layout/MessageBlock";
import { PageContainer } from "@/components/layout/PageContainer";
import { TextLinkButton } from "@/components/layout/TextLinkButton";
import { routes } from "@/lib/routes/routes";

export default function NotFound() {
  return (
    <PageContainer spacing="message">
      <MessageBlock code="404" title="Page not found">
        There is nothing at this address. It may have been renamed or removed.
      </MessageBlock>
      <ButtonRow>
        <TextLinkButton href={routes.apps}>Browse all privacy policies</TextLinkButton>
        <TextLinkButton href={routes.cv}>Read the CV</TextLinkButton>
      </ButtonRow>
    </PageContainer>
  );
}
