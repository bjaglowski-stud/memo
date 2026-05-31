import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type Card = {
  id: number;
  symbol: string;
  revealed: boolean;
  matched: boolean;
};

@Component({
  selector: 'app-game-board',
  imports: [CommonModule],
  templateUrl: './game-board.html',
  styleUrl: './game-board.css',
})
export class GameBoard {
  private readonly symbols = ['🍓', '🍋', '🍇', '🍉', '🌙', '⭐', '🔥', '🍀'];

  protected readonly cards = signal<Card[]>(this.createCards());
  protected readonly moves = signal(0);
  protected readonly pairsFound = signal(0);
  protected readonly locked = signal(false);
  protected readonly selectedCardId = signal<number | null>(null);

  // Check if the game is completed (all pairs found)
  protected get completed(): boolean {
    return this.pairsFound() === this.symbols.length;
  }

  // Start a new game by resetting all signals to their initial states
  protected startNewGame(): void {
    this.cards.set(this.createCards());
    this.moves.set(0);
    this.pairsFound.set(0);
    this.locked.set(false);
    this.selectedCardId.set(null);
  }

  // Flip a card when it's clicked
  protected flipCard(cardId: number): void {
    // Prevent flipping if the board is locked (e.g., during the timeout after a mismatch)
    if (this.locked()) {
      return;
    }

    const currentCards = this.cards();
    const currentCard = currentCards.find((card) => card.id === cardId);

    if (!currentCard || currentCard.revealed || currentCard.matched) {
      return;
    }

    const firstSelectionId = this.selectedCardId();

    this.cards.set(
      currentCards.map((card) => (card.id === cardId ? { ...card, revealed: true } : card)),
    );

    if (firstSelectionId === null) {
      this.selectedCardId.set(cardId);
      return;
    }

    this.moves.update((moves) => moves + 1);

    const firstCard = currentCards.find((card) => card.id === firstSelectionId);

    if (!firstCard) {
      this.selectedCardId.set(cardId);
      return;
    }

    if (firstCard.symbol === currentCard.symbol) {
      this.cards.update((cards) =>
        cards.map((card) =>
          card.symbol === currentCard.symbol ? { ...card, matched: true } : card,
        ),
      );

      this.pairsFound.update((pairsFound) => pairsFound + 1);
      this.selectedCardId.set(null);
      return;
    }

    this.locked.set(true);

    window.setTimeout(() => {
      this.cards.update((cards) =>
        cards.map((card) =>
          card.id === firstSelectionId || card.id === cardId
            ? { ...card, revealed: false }
            : card,
        ),
      );
      this.selectedCardId.set(null);
      this.locked.set(false);
    }, 850);
  }

  // TrackBy function for ngFor to optimize rendering
  protected trackCard(_: number, card: Card): number {
    return card.id;
  }

  // Create a shuffled deck of cards with pairs of symbols
  private createCards(): Card[] {
    const deck = [...this.symbols, ...this.symbols]
      .map((symbol, index) => ({
        id: index + 1,
        symbol,
        revealed: false,
        matched: false,
      }))
      .sort(() => Math.random() - 0.5);

    return deck;
  }
}
