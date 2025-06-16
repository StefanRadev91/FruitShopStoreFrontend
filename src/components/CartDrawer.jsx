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
        <Box>
          {cart.map((item) => (
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
                <Text fw={700} size="md" style={{ minWidth: 60 }}>
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
            </Box>
          ))}

          <Text fw={700} mt="lg">
            Общо: {total.toFixed(2)} лв.
          </Text>

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
            <Button
              type="submit"
              fullWidth
              mt="md"
              color="green"
              loading={loadingOrder}
            >
              Изпрати поръчка
            </Button>
          </form>
        </Box>
      )}
    </Drawer>
  );
}