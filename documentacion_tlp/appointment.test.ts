import { handler } from '../src/handlers/appointment.handler';

describe('appointment.handler', () => {
  it('should return a response with an appointmentId', async () => {
    const mockEvent = {
      body: JSON.stringify({
        insuredId: '00001',
        scheduleId: 101,
        countryISO: 'PE',
      }),
    };

    const result = await handler(mockEvent);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(body).toHaveProperty('appointmentId');
    expect(body.message).toBe('Appointment registered, processing');
  });
});
