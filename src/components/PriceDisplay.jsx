// src/components/PriceDisplay.jsx
import { Text, Group } from "@mantine/core";

// Цените в базата са в лева – на сайта се показват само в евро по официалния фиксиран курс.
const BGN_PER_EUR = 1.95583;

export function convertBGNToEUR(priceBGN) {
  return priceBGN / BGN_PER_EUR;
}

// Закръглена до цент цена в евро (число), за да се събират редовете в количката точно.
export function toEUR(priceBGN) {
  return Number.isFinite(priceBGN) ? Math.round(convertBGNToEUR(priceBGN) * 100) / 100 : 0;
}

// "12.34 €" от сума, която вече е в евро
export function eurAmount(amountEUR) {
  return `${amountEUR.toFixed(2)} €`;
}

export function formatEUR(priceBGN) {
  if (!Number.isFinite(priceBGN)) return "—";
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
