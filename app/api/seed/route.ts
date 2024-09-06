// import { products, products } from 'lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  // await products.insert(products).values([
  //   {
  //     id: 1,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp',
  //     name: 'Smartphone X Pro',
  //     status: 'active',
  //     price: '999.00',
  //     stock: 150,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 2,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp',
  //     name: 'Wireless Earbuds Ultra',
  //     status: 'active',
  //     price: '199.00',
  //     stock: 300,
  //     availableAt: new Date()
  //   }
  // ]);

  return Response.json({
    message: 'Uncomment to seed data after DB is set up.'
  });
}
