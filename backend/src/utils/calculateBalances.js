const calculateGroupBalances = (members, expenses, settlements) => {
  const netBalances = {};
  
  members.forEach((member) => {
    const id = member._id ? member._id.toString() : member.toString();
    netBalances[id] = 0;
  });

  expenses.forEach((expense) => {
    const payerId = expense.paidBy._id ? expense.paidBy._id.toString() : expense.paidBy.toString();
    
    if (netBalances[payerId] !== undefined) {
      netBalances[payerId] += expense.amount;
    }

    if (expense.splitAmong && expense.splitAmong.length > 0) {
      expense.splitAmong.forEach((item) => {
        const userId = item.user._id ? item.user._id.toString() : item.user.toString();
        if (netBalances[userId] !== undefined) {
          netBalances[userId] -= item.amount;
        }
      });
    }
  });

  settlements.forEach((settlement) => {
    const fromId = settlement.fromUser._id ? settlement.fromUser._id.toString() : settlement.fromUser.toString();
    const toId = settlement.toUser._id ? settlement.toUser._id.toString() : settlement.toUser.toString();

    if (netBalances[fromId] !== undefined) {
      netBalances[fromId] += settlement.amount;
    }
    if (netBalances[toId] !== undefined) {
      netBalances[toId] -= settlement.amount;
    }
  });

  const debtors = [];
  const creditors = [];

  Object.keys(netBalances).forEach((userId) => {
    const balance = Math.round(netBalances[userId] * 100) / 100;
    netBalances[userId] = balance;

    if (balance < -0.01) {
      debtors.push({ userId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ userId, amount: balance });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggestedSettlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > 0) {
      suggestedSettlements.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: roundedAmount
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (Math.abs(debtor.amount) < 0.01) i++;
    if (Math.abs(creditor.amount) < 0.01) j++;
  }

  return {
    netBalances,
    suggestedSettlements
  };
};

module.exports = { calculateGroupBalances };