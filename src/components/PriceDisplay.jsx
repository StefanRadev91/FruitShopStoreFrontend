// src/components/PriceDisplay.jsx
import { Text, Group } from "@mantine/core";

// Цените в базата са в лева – на сайта се показват само в евро по официалния фиксиран курс.
const BGN_PER_EUR = 1.95583;

export function convertBGNToEUR(priceBGN) {
  return priceBGN / BGN_PER_EUR;
}

export function formatEUR(priceBGN) {
  return `${convertBGNToEUR(priceBGN).toFixed(2)} €`;
}

export function PriceDisplay({ priceBGN, promoPriceBGN = null, size = "lg", compact = false }) {
  if (compact) {
    return (
      <Group gap={6} align="baseline">
        {promoPriceBGN ? (
          <>
            <Text size={size} fw={700} c="red">
              {formatEUR(promoPriceBGN)}
            </Text>
            <Text size="sm" style={{ textDecoration: "line-through", color: "#888" }}>
              {formatEUR(priceBGN)}
            </Text>
          </>
        ) : (
          <Text size={size} fw={700}>
            {formatEUR(priceBGN)}
          </Text>
        )}
      </Group>
    );
  }

  return (
    <div>
      {promoPriceBGN ? (
        <>
          <Text size={size} fw={700} c="red">
            {formatEUR(promoPriceBGN)}
          </Text>
          <Text size="sm" mt={4} style={{ textDecoration: "line-through", color: "#888" }}>
            {formatEUR(priceBGN)}
          </Text>
        </>
      ) : (
        <Text size={size} fw={700}>
          {formatEUR(priceBGN)}
        </Text>
      )}
    </div>
  );
}
