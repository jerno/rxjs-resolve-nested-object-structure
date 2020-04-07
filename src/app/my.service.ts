import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { map, tap, flatMap, toArray } from 'rxjs/operators';
import { UnaryFunction } from 'rxjs/interfaces';

export interface Conversation {
  id: string;
  displayNames?: string[];
  participants: string[];
};


@Injectable()
export class MyService {
  public delegate: {
    listActions$: Observable<any[]>,
    resolveEmailFn: (email: string) => Observable<{displayName: string, [key: string]: any}>,
  }

  getAllConversationMetadata(): Observable<Conversation[]> {
    return this.delegate.listActions$.pipe(
      flatMap(documentChangeActions => of(documentChangeActions).pipe(
        this.spreadArrayElements(),
        map(this.mapToConversation),
        flatMap((conversation: Conversation) => of(conversation).pipe(
          map(this.mapToEmailList),
          this.spreadArrayElements(),
          flatMap((email: string) => this.delegate.resolveEmailFn(email).pipe(
            map(this.mapToDisplayName)
          )),
          toArray(),
          map(displayNames => this.assignFieldsToConversation(displayNames, conversation)),
        )),
        toArray(),
      )),
    );
  }

  private spreadArrayElements(): UnaryFunction<Observable<any[]>, Observable<any>> {
    return flatMap((array: any[]) => array);
  }

  private mapToConversation(documentChangeAction): Conversation {
    const {id, data} = documentChangeAction.payload.doc;
    return {id, ...data()};
  }

  private mapToEmailList(conversation) {
    return conversation.participants;
  }

  private mapToDisplayName(avatar) {
    return avatar.displayName;
  }

  private assignFieldsToConversation(displayNames: string[], conversation: Conversation) {
    return Object.assign(conversation, { displayNames });
  }
}