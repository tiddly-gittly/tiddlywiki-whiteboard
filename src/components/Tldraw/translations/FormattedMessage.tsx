import main from './main.json';

export function FormattedMessage({ id }: { id: string }) {
  return <span>{main[id]}</span>;
}

export function useIntl() {
  return {
    formatMessage({ id }): string {
      return main[id];
    },
  };
}
