export const calculateAndFormatModifier = 
    (value: number): string => formatModifier(calculateModifier(value));

export const calculateModifier = 
    (value: number): number => Math.floor((value - 10) / 2);

export const formatModifier =
    (value: number): string => value >= 0 ? `+${value}` : value.toString();
