// Tests unitaires

import { testUser } from "src/users/tests/user-seeds";
import { ChangeSeats } from "src/webinars/use-cases/change-seats";
import { IWebinarRepository } from "src/webinars/ports/webinar-repository.interface";
import { Webinar } from "../entities/webinar.entity";
import { InMemoryWebinarRepository } from "../adapters/webinar-repository.in-memory";

// Test unitaire
describe('Feature : Change seats', () => {
  // Initialisation des variables
  let webinarRepository: IWebinarRepository;
  let useCase: ChangeSeats;
  
  const webinar = new Webinar({
    id: 'webinar-id',
    organizerId: testUser.alice.props.id,
    title: 'Webinar title',
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-01T01:00:00Z'),
    seats: 200,
  });

  // Initialisation des données
  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository([webinar]);
    useCase = new ChangeSeats(webinarRepository);
  });

  async function whenUserChangeSeatsWith(payload:any) {
    // Act
    return useCase.execute(payload);
  }

  async function thenUpdatedWebinarSeatsShouldBe(seats: number) {
    // Assert
    const updatedWebinar = await webinarRepository.findById('webinar-id');
    expect(updatedWebinar?.props.seats).toEqual(seats);
  }
    
  // Fonctionnalité à tester
  describe('Scenario: Happy path', () => {
    
    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 300,
    };

    it('should change the number of seats for a webinar', async () => {
      // Act
      await whenUserChangeSeatsWith(payload);
      // Assert
      await thenUpdatedWebinarSeatsShouldBe(300);
    });
  });

  describe('Scenario: Webinar does not exist', () => {
    // Code commun à notre scénario : payload...
    let payload = {
      user: testUser.alice,
      webinarId: 'id',
      seats: 100,
    };

    it('should throw an error if the webinar does not exist', async () => {
     // Vérification de la règle métier, condition testée...
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrowError('Webinar not found');
    });

    it('should verify the webinar seats', async () => {
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });

  describe('Scenario: Update the webinar of someone else', () => {
    // Code commun à notre scénario : payload...
    let payload = {
      user: testUser.bob,
      webinarId: 'webinar-id',
      seats: 100,
    };

    it('should throw an error if the user is not the organizer', async () => {
     // Vérification de la règle métier, condition testée...
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrowError('User is not allowed to update this webinar');
    });

    it('should verify the webinar seats', async () => {
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });
  
  describe('Scenario: Change seat to an inferior number', () => {

    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 50,
    };

    it('should throw an error if the number of seats is inferior to the current number of participants', async () => {
      //act
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrowError('You cannot reduce the number of seats');
    });

    it('should verify the webinar seats', async () => {
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });

  describe('Scenario:change seat to a number > 1000', () => {

    const payload = {
      user: testUser.alice,
      webinarId: 'webinar-id',
      seats: 1001,
    };


    it('should throw an error if the number of seats is superior to 1000', async () => {
      //act
      await expect(whenUserChangeSeatsWith(payload)).rejects.toThrowError('Webinar must have at most 1000 seats');
    });

    it('should verify the webinar seats', async () => {
      await thenUpdatedWebinarSeatsShouldBe(200);
    });
  });
});


