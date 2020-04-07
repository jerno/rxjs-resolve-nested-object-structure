import { TestBed } from "@angular/core/testing";
import { MyService } from "./my.service";
import { of } from "rxjs/observable/of";
import { forEach } from "@angular/router/src/utils/collection";

describe("Service: MyService", () => {
  const testForms: Array<any> = [
    {
      id: 2,
      questions: [
        {
          controlType: "radio",
          id: "like",
          label: "Do you like pizza?",
          options: [
            { label: "Yes", value: 1 },
            { label: "Of Course", value: 2 }
          ],
          required: true
        },
        {
          controlType: "text",
          id: "toppings",
          label: "What toppings do you like?",
          required: false
        }
      ],
      title: "Pizza Party"
    },
    {
      id: 5,
      questions: [
        {
          controlType: "select",
          id: "delicious",
          label: "What is the best cheese for a burger?",
          options: [
            { label: "", value: "no-cheese" },
            { label: "American", value: "american" },
            { label: "Cheddar", value: "cheddar" },
            { label: "Provolone", value: "provolone" },
            { label: "Swiss", value: "swiss" }
          ],
          required: true
        },
        {
          controlType: "textarea",
          id: "perfection",
          label: "Describe your perfect burger:",
          required: true
        }
      ],
      title: "Burger Bonanza"
    }
  ];
  let service: MyService;

  beforeEach(() => {
    service = new MyService();
  });

  it("#getData should return an array", done => {
    const documentChangeActions = of([
      {
        payload: {
          doc: {
            id: "101",
            data: () => ({
              participants: ["email1@test.com", "email2@test.com"]
            })
          }
        }
      },
      {
        payload: {
          doc: {
            id: "102",
            data: () => ({
              participants: [
                "email1@test.com",
                "email2@test.com",
                "email3@test.com",
                "email4@test.com"
              ]
            })
          }
        }
      }
    ]);

    const resolveEmail = (email) => {
      switch(email) {
        case 'email1@test.com':
          return of({ displayName: 'Joe' });
        case 'email2@test.com':
          return of({ displayName: 'Jack' });
        default:
          return of({ displayName: '' });
      }
    };

    service.delegate = {
      listActions$: documentChangeActions,
      resolveEmailFn: resolveEmail
    };

    const expected = [
      {
        id: "101",
        displayName: "Joe, Jack",
        participants: ["email1@test.com", "email2@test.com"]
      },
      {
        id: "102",
        displayName: "Joe, Jack +2 others",
        participants: ["email1@test.com", "email2@test.com", "email3@test.com", "email4@test.com"]
      }
    ];

    service
      .getAllConversationMetadata()
      .subscribe(
        x => {
          console.log("Response to getData", x);

          expect(x.length).toBe(expected.length);
          
          expected.forEach((item, index) => {
            expect(x[index].id).toEqual(item.id);
            expect(x[index].displayNames.join(", ")).toEqual(item.displayName);
            expect(x[index].participants).toEqual(item.participants);
          });

        },
        e => console.log(e),
        () => done()
      );
  });
});
