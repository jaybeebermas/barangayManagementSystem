import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'commonFilter',
  standalone: true
})
export class CommonFilterPipe implements PipeTransform {

  transform(options: any[] | null | undefined, value: any, labelKey: string = 'name', valueKey: string = 'value'): string | null {
    if (!options || !value) return null;
    
    const matchedOption = options.find(option => option[valueKey] === value);
    return matchedOption ? matchedOption[labelKey] : null;
  }

}
