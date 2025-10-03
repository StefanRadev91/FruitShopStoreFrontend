// src/components/CartDrawer.jsx - актуализирана версия
import {
  Drawer,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Textarea,
  Box,
} from "@mantine/core";
import { PriceDisplay, convertBGNToEUR } from "./PriceDisplay";

export function CartDrawer({
  cartOpened,
  onClose,
  cart,
  handleChangeQty,
  handleRemoveFromCart,
  handleSubmitOrder,
  loadingOrder,
  form,
}) {
  // Обща сума: използваме правилната логика за цени
  const total = cart.reduce((acc, item) => {
    const originalPrice = item.selectedWeight?.price ?? parseFloat(item.price);
    const promoPrice = item.selectedWeight
      ? item.selectedWeight.promo_price ?? null
      : item.promo_price
      ? parseFloat(item.promo_price)
      : null;
    
    const unitPrice = promoPrice ?? originalPrice;
    return acc + unitPrice * item.qty;
  }, 0);

  const totalEUR = convertBGNToEUR(total);

  return (
    <Drawer
      opened={cartOpened}
      onClose={onClose}
      title="Твоята количка"
      padding="md"
      size="md"
      lockScroll
      withinPortal={false}
      transitionProps={{ transition: "slide-right", duration: 200 }}
      overlayProps={{ opacity: 0.4, blur: 2 }}
      styles={{
        content: { maxWidth: "100vw" },
        body: { paddingBottom: "2rem" },
      }}
    >
      {cart.length === 0 ? (
        <Text>Количката е празна.</Text>
      ) : (
        <Box>
          {cart.map((item) => {
            const originalPrice = item.selectedWeight?.price ?? parseFloat(item.price);
            const promoPrice = item.selectedWeight
              ? item.selectedWeight.promo_price ?? null
              : item.promo_price
              ? parseFloat(item.promo_price)
              : null;
            
            const unitPrice = promoPrice ?? originalPrice;

            return (
              <Box key={item.id + (item.selectedWeight?.label || "")} mb="lg">
                <Text fw={600} size="sm" mb={4}>
                  {item.name}
                </Text>

                <Group spacing="xs" mb={6}>
                  <Badge color="green" radius="sm">
                    {item.category?.Name}
                  </Badge>
                  {item.selectedWeight?.label && (
                    <Badge color="gray" variant="outline" radius="sm">
                      {item.selectedWeight.label}
                    </Badge>
                  )}
                </Group>

                <Group spacing="xs" mb={6}>
                  <Button
                    size="xs"
                    color="green"
                    variant="filled"
                    onClick={() => handleChangeQty(item.id, -1)}
                  >
                    –
                  </Button>
                  <Text fw={500} mx="xs">
                    {item.qty}
                  </Text>
                  <Button
                    size="xs"
                    color="green"
                    variant="filled"
                    onClick={() => handleChangeQty(item.id, 1)}
                  >
                    +
                  </Button>
                </Group>

                <Group spacing="sm" position="apart" align="center">
                  {/* Използваме PriceDisplay компонента за показване на цените */}
                  <PriceDisplay
                    priceBGN={originalPrice}
                    promoPriceBGN={promoPrice}
                    size="sm"
                    compact={true}
                  />
                  
                  <Button
                    size="xs"
                    color="red"
                    variant="outline"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    Премахни
                  </Button>
                </Group>

                {/* Ред общо за продукта */}
                <Text size="xs" c="dimmed" mt={4}>
                  Общо: {(unitPrice * item.qty).toFixed(2)} лв. ({(convertBGNToEUR(unitPrice * item.qty)).toFixed(2)} €)
                </Text>
              </Box>
            );
          })}

          {/* Обща сума */}
          <Box
            style={{
              borderTop: "1px solid #eee",
              paddingTop: "1rem",
              marginTop: "1rem",
            }}
          >
            <Group position="apart" mb="md">
              <Text fw={700} size="lg">
                Общо:
              </Text>
              <Box>
                <Text fw={700} size="lg">
                  {total.toFixed(2)} лв.
                </Text>
                <Text size="sm" c="dimmed" ta="right">
                  ({totalEUR.toFixed(2)} €)
                </Text>
              </Box>
            </Group>

            <TextInput
              label="Име и фамилия"
              placeholder="Въведете име и фамилия (задължително поле)"
              {...form.getInputProps("name")}
              mb="sm"
            />
            <TextInput
              label="Телефон"
              placeholder="Въведете телефон (задължително поле)"
              {...form.getInputProps("phone")}
              mb="sm"
            />
            <TextInput
              label="Адрес за доставка (задължително поле)"
              placeholder="Въведете адрес"
              {...form.getInputProps("address")}
              mb="sm"
            />
            <TextInput
              label="Имейл (задължително поле)"
              placeholder="Въведете имейл"
              {...form.getInputProps("email")}
              mb="sm"
            />
            <Textarea
              label="Бележки (по желание)"
              placeholder="Допълнителни указания..."
              {...form.getInputProps("notes")}
              mb="md"
            />

            <Button
              fullWidth
              size="md"
              color="green"
              loading={loadingOrder}
              onClick={() => {
                if (form.validate().hasErrors) return;
                handleSubmitOrder(form.values);
              }}
            >
              Поръчай срещу {total.toFixed(2)} лв. ({totalEUR.toFixed(2)} €)
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}