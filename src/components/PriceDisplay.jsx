// src/components/PriceDisplay.jsx
import { Text, Group } from "@mantine/core";

// Фиксиран курс на лева към евро (може да се вземе от API или конфигурация)
const BGN_TO_EUR_RATE = 0.5113; // 1 лв = 0.5113 евро (официален фиксиран курс)

export function PriceDisplay({ 
  priceBGN, 
  promoPriceBGN = null, 
  size = "lg", 
  showCurrency = true,
  compact = false 
}) {
  const originalPriceEUR = priceBGN * BGN_TO_EUR_RATE;
  const promoPriceEUR = promoPriceBGN ? promoPriceBGN * BGN_TO_EUR_RATE : null;

  if (compact) {
    // Компактен изглед - винаги показваме и двете валути
    return (
      <Group gap={4} align="baseline">
        {promoPriceBGN ? (
          <>
            <Text size={size} fw={700} c="red">
              {promoPriceBGN.toFixed(2)} лв.
            </Text>
            <Text size="xs" c="red">
              ({promoPriceEUR.toFixed(2)} €)
            </Text>
            <Text size="sm" style={{ textDecoration: "line-through", color: "#888" }}>
              {priceBGN.toFixed(2)} лв.
            </Text>
            <Text size="xs" style={{ textDecoration: "line-through", color: "#999" }}>
              ({originalPriceEUR.toFixed(2)} €)
            </Text>
          </>
        ) : (
          <>
            <Text size={size} fw={700}>
              {priceBGN.toFixed(2)} лв.
            </Text>
            <Text size="xs" c="dimmed">
              ({originalPriceEUR.toFixed(2)} €)
            </Text>
          </>
        )}
      </Group>
    );
  }

  // Пълен изглед със стакинг
  return (
    <div>
      {promoPriceBGN ? (
        <>
          {/* Промо цена */}
          <Group gap={8} align="baseline">
            <Text size={size} fw={700} c="red">
              {promoPriceBGN.toFixed(2)} лв.
            </Text>
            <Text size="sm" c="red">
              ({promoPriceEUR.toFixed(2)} €)
            </Text>
          </Group>
          
          {/* Зачеркната оригинална цена */}
          <Group gap={8} align="baseline" mt={4}>
            <Text size="sm" style={{ textDecoration: "line-through", color: "#888" }}>
              {priceBGN.toFixed(2)} лв.
            </Text>
            <Text size="xs" style={{ textDecoration: "line-through", color: "#999" }}>
              ({originalPriceEUR.toFixed(2)} €)
            </Text>
          </Group>
        </>
      ) : (
        <>
          {/* Редовна цена */}
          <Group gap={8} align="baseline">
            <Text size={size} fw={700}>
              {priceBGN.toFixed(2)} лв.
            </Text>
            <Text size="sm" c="dimmed">
              ({originalPriceEUR.toFixed(2)} €)
            </Text>
          </Group>
        </>
      )}
    </div>
  );
}

// Utility функция за конвертиране на лева в евро
export function convertBGNToEUR(priceBGN) {
  return priceBGN * BGN_TO_EUR_RATE;
}

// Hook за работа с валути
export function useCurrencyConverter() {
  const convertToEUR = (priceBGN) => priceBGN * BGN_TO_EUR_RATE;
  
  const formatPrice = (priceBGN, showEUR = true) => {
    const priceEUR = convertToEUR(priceBGN);
    if (showEUR) {
      return `${priceBGN.toFixed(2)} лв. (${priceEUR.toFixed(2)} €)`;
    }
    return `${priceBGN.toFixed(2)} лв.`;
  };

  return {
    convertToEUR,
    formatPrice,
    rate: BGN_TO_EUR_RATE
  };
}