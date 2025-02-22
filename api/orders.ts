export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
  } catch (error) {
    throw new Error('Failed to delete order');
  }
}
