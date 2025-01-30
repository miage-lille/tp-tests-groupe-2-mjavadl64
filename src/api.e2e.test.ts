import { error } from 'console';
import { TestServerFixture } from './tests/fixtures';
import supertest from 'supertest';
import { be } from 'date-fns/locale';

describe('Webinar Route E2E', () => {

    jest.setTimeout(30000);
    let fixture: TestServerFixture;

    beforeAll(async () => {
        fixture = new TestServerFixture();
        await fixture.init();
    });

    beforeEach(async () => {
        await fixture.reset();
    });

    describe('happy path', () => {
        it('Should update webinar seats', async () => {
            // ARRANGE
            const prisma = fixture.getPrismaClient();
            const server = fixture.getServerInstance();

            const webinar = await prisma.webinar.create({
                data: {
                    id: 'webinar-id',
                    organizerId: 'test-user',
                    title: 'Webinar title',
                    startDate: new Date(),
                    endDate: new Date(),
                    seats: 10,
                },
            });

            // ACT
            const response = await supertest(server)
                .post(`/webinars/${webinar.id}/seats`)
                .send({ seats: '30' })
                .expect(200);

            // ASSERT
            expect(response.body).toEqual({ message: 'Seats updated' });
              
            const updatedWebinar = await prisma.webinar.findUnique({
            where: { id: webinar.id },
            });
            expect(updatedWebinar?.seats).toBe(30);
        });
    });
    
    beforeEach(async () => {
        await fixture.reset();
    });

    describe('Webinar does not exist', () => {
        it ('Should return 404', async () => {

            // ARRANGE
            const prisma = fixture.getPrismaClient();
            const server = fixture.getServerInstance();

            const webinar = await prisma.webinar.create({
                data: {
                    id: 'webinar-id',
                    organizerId: 'test-user',
                    title: 'Webinar title',
                    startDate: new Date(),
                    endDate: new Date(),
                    seats: 10,
                },
            });

            // ACT

            const response = await supertest(server)
                .post('/webinars/id-webinar/seats')
                .send({ seats: '30' })
                .expect(404);

            // ASSERT
            expect (response.body).toEqual({ error: 'Webinar not found' });
  
            const updatedWebinar = await prisma.webinar.findUnique({
                where: { id: webinar.id },
            });
    
            expect(updatedWebinar?.seats).toBe(10);

        });
    });

    beforeEach(async () => {
        await fixture.reset();
    });

    describe('User does not have permission', () => {  
        it('Should return 403', async () => {

            // ARRANGE
            const prisma = fixture.getPrismaClient();
            const server = fixture.getServerInstance();

            const webinar = await prisma.webinar.create({
                data: {
                    id: 'webinar-id',
                    organizerId: 'user',
                    title: 'Webinar title',
                    startDate: new Date(),
                    endDate: new Date(),
                    seats: 10,
                },
            });

            // ACT

            const response = await supertest(server)
                .post('/webinars/webinar-id/seats')
                .send({ seats: '30' })
                .expect(401);

            // ASSERT
            expect(response.body).toEqual({ error: 'User is not allowed to update this webinar' });

            const updatedWebinar = await prisma.webinar.findUnique({
                where: { id: webinar.id },
            });
    
            expect(updatedWebinar?.seats).toBe(10);
        });
    });

    afterAll(async () => {
        await fixture.stop();
    });
});


