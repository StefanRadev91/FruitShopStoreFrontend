import { Box, Title, Text, Stack } from "@mantine/core";

export default function DeliveryPage() {
  return (
    <Box py="xl" px="md" maw={800} mx="auto">
      <Title order={2} mb="md">Доставка за дома или офиса</Title>
      <Stack gap="md">
        <Text>
          Чрез Онлайн платформата Дар от Земята , можете лесно и удобно да направите поръчка за доставка само с няколко клика.
        </Text>
        <Text>
          <strong>Доставка в София:</strong> понеделник - неделя
          <br /> <strong>/СОБСТВЕН ТРАНСПОРТ/</strong>
        </Text>
        <Text>
          Поръчки над 40 лв. – <strong>Безплатна доставка</strong> до адрес. <br />
          Поръчки под 40 лв. – <strong>Доставка 5 лв.</strong>
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