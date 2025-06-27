export function User(row) {
  return {
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    salt: row.salt,
    created_at: row.created_at
  };
}

export function Card(row) {
  return {
    id: row.id,
    name: row.name,
    image_url: row.image_url,
    misfortune_index: row.misfortune_index,
    theme: row.theme
  };
}

export function Game(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status, // 'completed' | 'ongoing'
    outcome: row.outcome, // 'won' | 'lost' | null
    total_cards: row.total_cards,
    created_at: row.created_at
  };
}

export function GameCard(row) {
  return {
    game_id: row.game_id,
    card_id: row.card_id,
    round_number: row.round_number,
    won: !!row.won,
    initial_card: !!row.initial_card
  };
}