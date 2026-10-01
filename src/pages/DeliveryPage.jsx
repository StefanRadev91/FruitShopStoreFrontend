import { Box, Title, Text, Stack } from "@mantine/core";
import { Seo } from "../seo/Seo";

export default function DeliveryPage() {
  return (
    <Box py="xl" px="md" maw={800} mx="auto">
      <Seo title="Доставка за дома и офиса" path="/delivery" description="Условия за доставка до дома или офиса в София: безплатна доставка над 20.45 €, избор на часови интервал и доставка от понеделник до неделя." />
      <Title order={1} size="h2" mb="md">Доставка за дома или офиса</Title>
      <Stack gap="md">
        <Text>
          Чрез Онлайн платформата Дар от Земята , можете лесно и удобно да направите поръчка за доставка само с няколко клика.
        </Text>
        <Text>
          <strong>Доставка в София:</strong> понеделник - неделя
          <br /> <strong>/СОБСТВЕН ТРАНСПОРТ/</strong>
        </Text>
        <Text>
          Поръчки над 20.45 € – <strong>Безплатна доставка</strong> до адрес. <br />
          Поръчки под 20.45 € – <strong>Доставка 2.56 €</strong>
        </Text>
        <Text>
          Часовите интервали, в които можеш да получиш поръчката си, са:
        </Text>
        <ul style={{ paddingLeft: 20 }}>
          <li>Заявки направени преди обяд се доставят на същия ден.</li>
          <li>Заявки направени след 12:00 ч. се изпълняват на следващия ден до обяд.</li>
        </ul>
      </Stack>
    </Box>
  );
}