import { Box, Title, Text, Stack } from "@mantine/core";

export default function AboutPage() {
  return (
    <Box py="xl" px="md" maw={800} mx="auto">
      <Title order={2} mb="md">Доставка за ресторант или търговски обект</Title>
      <Stack gap="md">
        <Text>
          Чрез Онлайн платформата Дар от Земята, можете лесно и удобно да направите поръчка за доставка само с няколко клика.
        </Text>
        <Text>
          <strong>Доставка в София:</strong> понеделник – неделя<br />
          <strong>/СОБСТВЕН ТРАНСПОРТ/</strong>
        </Text>
        <Text>
          <strong>Часовите интервали, в които можеш да получиш поръчката си, са:</strong><br />
          Заявки направени преди обяд се доставят на същия ден.<br />
          Заявки направени след 12:00 ч. се изпълняват на следващия ден до обяд.
        </Text>
      </Stack>
    </Box>
  );
}