import { prisma } from '@/server/db';
import { recordAuditLog } from '@/server/audit/audit-service';

export interface ShippingRequest {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  district?: string;
  provider?: string;
}

export const shippingAdapter = {
  async createShipment(req: ShippingRequest) {
    const provider = req.provider || process.env.SHIPPING_PROVIDER || 'YURTICI';
    const trackingNumber = `TRK-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const shipment = await prisma.shipment.create({
      data: {
        orderId: req.orderId,
        provider,
        trackingNumber,
        status: 'SHIPPED',
        labelUrl: `/api/v1/shipments/${req.orderId}/label.pdf`,
      }
    });

    await recordAuditLog({
      action: 'SHIPMENT_CREATED',
      entityType: 'Shipment',
      entityId: shipment.id,
      afterJson: JSON.stringify({ trackingNumber, provider }),
    });

    return shipment;
  }
};
