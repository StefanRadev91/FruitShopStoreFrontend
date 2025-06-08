// ✅ CartDrawer.jsx – с правилно изчисляване на total с избраната цена от грамаж
import {
  Drawer,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Textarea,
} from "@mantine/core";

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
  const total = cart.reduce((acc, item) => {
    const unitPrice = item.selectedWeight?.price ?? parseFloat(item.price);
    return acc + unitPrice * item.qty;
  }, 0);

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
        <div>
          {cart.map((item) => (
            <Group key={item.id + (item.selectedWeight?.label || "")} position="apart" mb="sm">
              <div>
                <Text fw={500}>{item.name}</Text>

                {item.selectedWeight?.label && (
                  <Text size="sm" c="dimmed">
                    Тегло: {item.selectedWeight.label}
                  </Text>
                )}

                <Badge color="green" ml="sm">{item.category?.Name}</Badge>
                <div>
                  <Button size="xs" onClick={() => handleChangeQty(item.id, -1)}>-</Button>
                  <Text component="span" mx="sm">{item.qty}</Text>
                  <Button size="xs" onClick={() => handleChangeQty(item.id, 1)}>+</Button>
                </div>
              </div>
              <Group>
                <Text fw={700}>
                  {(item.selectedWeight?.price ?? parseFloat(item.price)).toFixed(2)} лв.
                </Text>
                <Button
                  size="xs"
                  color="red"
                  variant="outline"
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  Премахни
                </Button>
              </Group>
            </Group>
          ))}
          <Text fw={700} mt="lg">Общо: {total.toFixed(2)} лв.</Text>
          <form onSubmit={form.onSubmit(handleSubmitOrder)}>
            <TextInput
              label="Име и фамилия"
              placeholder="Иван Иванов"
              withAsterisk
              {...form.getInputProps("name")}
              mb="sm"
            />
            <TextInput
              label="Телефон"
              placeholder="0888123456"
              withAsterisk
              {...form.getInputProps("phone")}
              mb="sm"
            />
            <TextInput
              label="Адрес"
              placeholder="гр. София, ул. Пример 1"
              withAsterisk
              {...form.getInputProps("address")}
              mb="sm"
            />
            <TextInput
              label="Email"
              placeholder="client@email.com"
              {...form.getInputProps("email")}
              mb="sm"
            />
            <Textarea
              label="Бележка (по избор)"
              placeholder="Допълнителна информация..."
              {...form.getInputProps("notes")}
              mb="sm"
            />
            <Button type="submit" fullWidth mt="md" color="green" loading={loadingOrder}>
              Изпрати поръчка
            </Button>
          </form>
        </div>
      )}
    </Drawer>
  );
}