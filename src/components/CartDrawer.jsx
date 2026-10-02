import {
  Drawer,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Textarea,
  Box,
  ActionIcon,
  Progress,
  Divider,
  Stack,
  Image,
} from "@mantine/core";
import { Link } from "react-router-dom";
import {
  IconTrash,
  IconMinus,
  IconPlus,
  IconTruckDelivery,
  IconCircleCheck,
  IconShoppingCartOff,
} from "@tabler/icons-react";
import { PriceDisplay, formatEUR, toEUR } from "./PriceDisplay";
import { cartKey, summarizeCart, unitPriceBGN } from "../services/cart";
import { imageUrl } from "../services/productsAPI";

const eur = (n) => `${n.toFixed(2)} €`;

function itemPrices(item) {
  const originalPrice = item.selectedWeight?.price ?? parseFloat(item.price);
  const promoPrice = item.selectedWeight
    ? item.selectedWeight.promo_price ?? null
    : item.promo_price
    ? parseFloat(item.promo_price)
    : null;
  return { originalPrice, promoPrice };
}

function SummaryRow({ label, value, strong, color }) {
  return (
    <Group justify="space-between">
      <Text size={strong ? "lg" : "sm"} fw={strong ? 800 : 400} c={color || (strong ? undefined : "dimmed")}>
        {label}
      </Text>
      <Text size={strong ? "lg" : "sm"} fw={strong ? 800 : 600} c={color}>
        {value}
      </Text>
    </Group>
  );
}

function Confirmation({ confirmation, onClose }) {
  const { id, items, summary, name, phone } = confirmation;
  return (
    <Stack align="center" gap="sm" py="md" ta="center">
      <IconCircleCheck size={64} color="#2f9e44" stroke={1.5} />
      <Text fw={800} size="xl">
        Благодарим ти{name ? `, ${name.split(" ")[0]}` : ""}!
      </Text>
      <Text c="dimmed" size="sm">
        Поръчката е изпратена{id ? <> – <b>№ {id}</b></> : ""}. Ще се свържем с теб на {phone} за потвърждение.
      </Text>

      <Box w="100%" mt="sm" p="md" style={{ background: "#f6faf6", borderRadius: 12, textAlign: "left" }}>
        <Text fw={700} size="sm" mb={8}>
          Резюме на поръчката
        </Text>
        <Stack gap={6}>
          {items.map((item) => (
            <Group key={cartKey(item)} justify="space-between" wrap="nowrap" align="flex-start">
              <Text size="sm" lineClamp={2}>
                {item.qty} × {item.name}
                {item.selectedWeight?.label ? ` (${item.selectedWeight.label})` : ""}
              </Text>
              <Text size="sm" fw={600} style={{ whiteSpace: "nowrap" }}>
                {eur(toEUR(unitPriceBGN(item)) * item.qty)}
              </Text>
            </Group>
          ))}
        </Stack>
        <Divider my="sm" />
        <SummaryRow label="Продукти" value={eur(summary.subtotalEUR)} />
        <SummaryRow label="Доставка" value={summary.freeDelivery ? "Безплатна" : eur(summary.deliveryEUR)} />
        <Divider my="sm" />
        <SummaryRow label="Общо" value={eur(summary.totalEUR)} strong />
      </Box>

      <Button color="green" fullWidth size="md" mt="sm" onClick={onClose}>
        Продължи пазаруването
      </Button>
    </Stack>
  );
}

export function CartDrawer({
  cartOpened,
  onClose,
  cart,
  handleChangeQty,
  handleRemoveFromCart,
  handleSubmitOrder,
  loadingOrder,
  form,
  confirmation,
  hasSavedCustomer,
  onForgetCustomer,
}) {
  const summary = summarizeCart(cart);

  return (
    <Drawer
      opened={cartOpened}
      onClose={onClose}
      title={<Text fw={800} size="lg">Твоята количка</Text>}
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
      {confirmation && cart.length === 0 ? (
        <Confirmation confirmation={confirmation} onClose={onClose} />
      ) : cart.length === 0 ? (
        <Stack align="center" gap="sm" py={40} ta="center">
          <IconShoppingCartOff size={56} color="#adb5bd" stroke={1.4} />
          <Text fw={700} size="lg">
            Количката е празна
          </Text>
          <Text c="dimmed" size="sm">
            Добави продукти и ще ги намериш тук.
          </Text>
          <Button component={Link} to="/" color="green" variant="light" onClick={onClose}>
            Разгледай продуктите
          </Button>
        </Stack>
      ) : (
        <Box>
          {/* Безплатна доставка – прогрес */}
          <Box p="sm" mb="md" style={{ background: summary.freeDelivery ? "#ebfbee" : "#fff8e6", borderRadius: 12 }}>
            <Group gap={8} wrap="nowrap" mb={summary.freeDelivery ? 0 : 8}>
              <IconTruckDelivery size={22} color={summary.freeDelivery ? "#2f9e44" : "#e8590c"} />
              <Text size="sm" fw={600}>
                {summary.freeDelivery ? (
                  "Имаш безплатна доставка!"
                ) : (
                  <>
                    Още <b>{eur(summary.remainingEUR)}</b> до безплатна доставка
                  </>
                )}
              </Text>
            </Group>
            {!summary.freeDelivery && (
              <Progress value={summary.progress} color="orange" size="sm" radius="xl" aria-label="Прогрес до безплатна доставка" />
            )}
          </Box>

          {/* Артикули */}
          <Stack gap="md">
            {cart.map((item) => {
              const { originalPrice, promoPrice } = itemPrices(item);
              const key = cartKey(item);
              const lineTotal = toEUR(unitPriceBGN(item)) * item.qty;
              return (
                <Group key={key} gap="sm" wrap="nowrap" align="flex-start">
                  <Box
                    component={item.slug ? Link : "div"}
                    {...(item.slug ? { to: `/product/${item.slug}`, onClick: onClose } : {})}
                    style={{ flexShrink: 0 }}
                  >
                    <Image
                      src={imageUrl(item.image, 360)}
                      alt={item.name}
                      w={64}
                      h={64}
                      fit="contain"
                      radius="md"
                      style={{ background: "#fff", border: "1px solid #eee" }}
                    />
                  </Box>

                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap" align="flex-start" gap={6}>
                      <Text fw={600} size="sm" lineClamp={2}>
                        {item.name}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        aria-label={`Премахни ${item.name}`}
                        onClick={() => handleRemoveFromCart(key)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>

                    {item.selectedWeight?.label && (
                      <Badge color="gray" variant="outline" radius="sm" size="sm" mt={2}>
                        {item.selectedWeight.label}
                      </Badge>
                    )}

                    <Group justify="space-between" mt={6} wrap="nowrap">
                      <Group gap={4} wrap="nowrap">
                        <ActionIcon
                          size="md"
                          variant="light"
                          color="green"
                          aria-label="Намали количеството"
                          onClick={() => handleChangeQty(key, -1)}
                          disabled={item.qty <= 1}
                        >
                          <IconMinus size={14} />
                        </ActionIcon>
                        <Text fw={700} size="sm" w={28} ta="center">
                          {item.qty}
                        </Text>
                        <ActionIcon
                          size="md"
                          variant="light"
                          color="green"
                          aria-label="Увеличи количеството"
                          onClick={() => handleChangeQty(key, 1)}
                        >
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Group>
                      <Box ta="right">
                        <Text fw={800} size="sm">
                          {eur(lineTotal)}
                        </Text>
                        {item.qty > 1 && (
                          <Text size="xs" c="dimmed">
                            {formatEUR(promoPrice ?? originalPrice)} / бр.
                          </Text>
                        )}
                      </Box>
                    </Group>
                    {promoPrice && (
                      <Box mt={2}>
                        <PriceDisplay priceBGN={originalPrice} promoPriceBGN={promoPrice} size="xs" compact />
                      </Box>
                    )}
                  </Box>
                </Group>
              );
            })}
          </Stack>

          {/* Суми */}
          <Box mt="lg" pt="md" style={{ borderTop: "1px solid #eee" }}>
            <Stack gap={6}>
              <SummaryRow label="Продукти" value={eur(summary.subtotalEUR)} />
              <SummaryRow
                label="Доставка (София)"
                value={summary.freeDelivery ? "Безплатна" : eur(summary.deliveryEUR)}
                color={summary.freeDelivery ? "green" : undefined}
              />
              <Divider my={4} />
              <SummaryRow label="Общо" value={eur(summary.totalEUR)} strong />
            </Stack>
          </Box>

          {/* Данни за доставка */}
          <Box mt="lg">
            <Text fw={700} mb="xs">
              Данни за доставка
            </Text>
            <TextInput
              label="Име и фамилия (задължително поле)"
              placeholder="Въведете име и фамилия"
              autoComplete="name"
              {...form.getInputProps("name")}
              mb="sm"
            />
            <TextInput
              label="Телефон (задължително поле)"
              placeholder="Въведете телефон"
              autoComplete="tel"
              inputMode="tel"
              {...form.getInputProps("phone")}
              mb="sm"
            />
            <TextInput
              label="Адрес за доставка (задължително поле)"
              placeholder="Въведете адрес"
              autoComplete="street-address"
              {...form.getInputProps("address")}
              mb="sm"
            />
            <TextInput
              label="Имейл (задължително поле)"
              placeholder="Въведете имейл"
              autoComplete="email"
              inputMode="email"
              {...form.getInputProps("email")}
              mb="sm"
            />
            <Textarea
              label="Бележки (по желание)"
              placeholder="Допълнителни указания..."
              {...form.getInputProps("notes")}
              mb="xs"
            />
            {hasSavedCustomer && (
              <Text size="xs" c="dimmed" mb="md">
                Запомнихме данните ти на това устройство за следващата поръчка.{" "}
                <Text component="a" href="#" size="xs" c="blue" onClick={(e) => { e.preventDefault(); onForgetCustomer(); }}>
                  Забрави ги
                </Text>
              </Text>
            )}

            <Button
              fullWidth
              size="md"
              color="green"
              loading={loadingOrder}
              mt={hasSavedCustomer ? 0 : "md"}
              onClick={() => {
                if (form.validate().hasErrors) return;
                handleSubmitOrder(form.values);
              }}
            >
              Поръчай срещу {eur(summary.totalEUR)}
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
}
